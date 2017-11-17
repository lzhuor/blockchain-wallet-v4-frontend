import {CommitmentSigned, OpenChannel, RevokeAndAck, UpdateAddHtlc} from './messages/serializer'
import * as random from 'crypto'
import assert from 'assert'
import {
  Channel, ChannelParams, ChannelUpdateTypes, ChannelUpdateWrapper, Direction, Payment,
  PaymentWrapper
} from './state'

import {List, fromJS} from 'immutable'
import {generatePerCommitmentPoint} from './key_derivation'

const ec = require('../../../bcoin/lib/crypto/secp256k1-browser')
const Long = require('long')
const sha = require('sha256')

export let phase = {
  SENT_OPEN: 1,
  SENT_FUNDING_CREATED: 2,
  FUNDING_CONFIRMING: 3,
  SENT_FUNDING_LOCKED: 4,
  OPEN: 5
}

let createKey = () => {
  let key = {}
  key.priv = random.randomBytes(32)
  key.pub = ec.publicKeyCreate(key.priv, true)
  return fromJS(key)
}

export let wrapPubKey = (pub) => ({pub, priv: null})

let checkChannel = (channel, phase) => {
  assert(channel !== undefined)
  assert(channel.phase === phase)
}

let getChannel = (state, channelId) => state.getIn(['channels', channelId])
let getChannelCheck = (state, channelId, phase) => checkChannel(getChannel(state, channelId), phase)

let addMessage = (msg) => state => state.updateIn(['messageOut'], o => o.push(msg))
let updateChannel = (state, channelId, channel) => state.updateIn(['channels'], o => o.set(channelId, channel))

export let obscureHash = (basePoint1, basePoint2) => {
  let b = Buffer.concat([basePoint1, basePoint2])
  let s = Buffer.from(sha(b), 'hex')
  return s
}

export function openChannel (state, peer, options, value) {
  let channelId = random.randomBytes(32) // TODO
  let commitmentSecret = random.randomBytes(32)

  let paramsLocal = ChannelParams(
    createKey(),
    options.dustLimitSatoshis,
    options.maxHtlcValueInFlightMsat,
    options.channelReserveSatoshis,
    options.htlcMinimumMsat,
    options.toSelfDelay,
    options.maxAcceptedHtlcs,
    createKey(),
    createKey(),
    createKey(),
    options.gf,
    options.lf)
  let paramsJS = paramsLocal.toJS()

  let nextCommitmentPoint = generatePerCommitmentPoint(commitmentSecret, Math.pow(2, 48) - 1)

  let open = OpenChannel(
    options.chainHash,
    channelId,
    value,
    new Long(0),
    paramsJS.dustLimitSatoshis,
    value,
    new Long(0),
    new Long(0),
    paramsJS.feeratePerKw,
    paramsJS.toSelfDelay,
    paramsJS.maxAcceptedHtlcs,
    paramsJS.fundingKey.pub,
    paramsJS.revocationBasepoint.pub,
    paramsJS.paymentBasepoint.pub,
    paramsJS.delayedPaymentBasepoint.pub,
    nextCommitmentPoint,
    Buffer.alloc(1)
  )

  let channel = Channel()
    .set('staticRemote', peer.staticRemote)
    .set('channelId', channelId)
    .set('paramsLocal', paramsLocal)
    .set('phase', phase.SENT_OPEN)
    .set('commitmentSecretSeed', commitmentSecret)
    .setIn(['local', 'nextCommitmentPoint'], nextCommitmentPoint)
    .update(addMessage(open))

  return updateChannel(state, channelId, channel)
}

export function readAcceptChannel (msg, state, peer) {
  let channel = getChannelCheck(state, msg.channelId, phase.SENT_OPEN)

  let paramsRemote = ChannelParams(
    wrapPubKey(msg.fundingPubkey),
    msg.dustLimitSatoshis,
    msg.maxHtlcValueInFlightMsat,
    msg.channelReserveSatoshis,
    msg.htlcMinimumMsat,
    msg.toSelfDelay,
    msg.maxAcceptedHtlcs,
    wrapPubKey(msg.revocationBasepoint),
    wrapPubKey(msg.paymentBasepoint),
    wrapPubKey(msg.delayedPaymentBasepoint),
    wrapPubKey(msg.revocationBasepoint),
    peer.gf,
    peer.lf)

  return channel
    .set('paramsRemote', paramsRemote)
    .set('minimumDepth', msg.minimumDepth)
    .setIn(['remote', 'nextCommitmentPoint'], msg.nextCommitmentPoint)
}

export function sendFundingCreated (channelId, state, wallet) {

}

let reverseWrapper = (wrapper) => {
  return wrapper.update('direction', (d) => {
    if (d === Direction.OFFERED) {
      return Direction.RECEIVED
    } else {
      return Direction.OFFERED
    }
  })
}

let getPaymentI = (state, id) => state.getIn(['payments', 'mapI', id])
let getPaymentO = (state, id) => state.getIn(['payments', 'mapO', id])

let filterPayment = (id) => { return a => { return a !== id } }
let wrapPayment = (msg, direction) => PaymentWrapper(direction, msg.id, Payment(msg.amountMsat, msg.paymentHash, msg.onionRoutingPackage, msg.cltvTimeout))

let applyAdd = (channelState, msg, direction) => {
  // A new payment is added to the channelState
  // We need to remove balance and add it to the commitment tx
  if (direction === Direction.RECEIVED) {
    return channelState
      .update('amountMsatRemote', a => a.sub(msg.amountMsat))
      .update('committed', a => a.push(wrapPayment(msg, direction)))
  } else {
    return channelState
      .update('amountMsatLocal', a => a.sub(msg.amountMsat))
      .update('committed', a => a.push(wrapPayment(msg, direction)))
  }
}

let applyFulfill = (channelState, msg, direction) => {
  // This payment got successfully resolved
  // We credit our balance with the amount of the payment and
  // remove it from the commitment tx
  // TODO need to save the secret somewhere
  if (direction === Direction.RECEIVED) {
    let payment = getPaymentO(channelState, msg.id)
    return channelState
      .update('amountMsatRemote', a => a.add(payment.get('amount')))
      .update('committed', filterPayment(msg.id))
  } else {
    let payment = getPaymentI(channelState, msg.id)
    return channelState
      .update('amountMsatLocal', a => a.add(payment.get('amount')))
      .update('committed', filterPayment(msg.id))
  }
}

let applyFail = (channelState, msg, direction) => {
  // This payment failed, this means we need to credit our balance with
  // the amount of this payment again and remove it from the commitment tx
  if (direction === Direction.RECEIVED) {
    let payment = getPaymentO(channelState, msg.id)
    return channelState
      .update('amountMsatLocal', a => a.add(payment.get('amount')))
      .updateIn(['committed', 'o'], filterPayment(msg.id))
  } else {
    let payment = getPaymentI(channelState, msg.id)
    return channelState
      .update('amountMsatRemote', a => a.add(payment.get('amount')))
      .updateIn(['committed', 'i'], filterPayment(msg.id))
  }
}

// TODO do we need to handle this case much differently?
let applyMalformed = (channelState, fail, direction) => applyFail(channelState, fail, direction)

let applyWrapper = (channelState, wrapper) => {
  let {type, direction, msg} = wrapper.toJS()

  if (type === ChannelUpdateTypes.ADD) {
    return applyAdd(channelState, msg, direction)
  } else if (type === ChannelUpdateTypes.FULFILL) {
    return applyFulfill(channelState, msg, direction)
  } else if (type === ChannelUpdateTypes.FAIL) {
    return applyFail(channelState, msg, direction)
  } else if (type === ChannelUpdateTypes.FAIL_MALFORMED) {
    return applyMalformed(channelState, msg, direction)
  } else {
    throw new Error('Unknown wrapper? ' + JSON.stringify(wrapper))
  }
}

let applyWrapperList = (list, state) => list.reduce((s, w) => applyWrapper(s, w), state)

let localPaymentIndexPath = ['local', 'indexes', 'inU']
let localUpdateCounterPath = ['local', 'updateCounter']
let localCommitIndexPath = ['local', 'commitIndex']

let remotePaymentIndexPath = ['remote', 'indexes', 'inU']
let remoteUpdateCounterPath = ['remote', 'updateCounter']
let remoteCommitIndexPath = ['remote', 'commitIndex']

let increment = path => c => c.updateIn(path, i => i.add(1))
let setter = (path1, path2) => c => c.setIn(path1, c.getIn(path2))

let addWrapper = (channel, list, index, type, direction, msg) => {
  let commitIndex = channel.getIn([index, 'updateCounter'])
  return channel.updateIn([list, 'unack'], l => l.push(ChannelUpdateWrapper(type, direction, commitIndex, msg)))
}

let createAddMessage = (channelId, paymentIndex, payment) => {
  return UpdateAddHtlc(
    channelId,
    paymentIndex,
    payment.get('amount'),
    payment.get('paymentHash'),
    payment.get('cltvTimeout'),
    payment.get('onionRoutingPackage'))
}

export function createUpdateAddHtlc (channelId, state, payment) {
  let channel = getChannel(state, channelId)
    .update(increment(localPaymentIndexPath))
    .update(increment(remoteUpdateCounterPath))

  // TODO check if we actually have enough money to make this payment
  let paymentIndex = channel.getIn(localPaymentIndexPath)
  let msg = createAddMessage(channelId, paymentIndex, payment)

  channel = channel
    .update(s => addWrapper(s, 'remote', 'remote', ChannelUpdateTypes.ADD, Direction.RECEIVED, msg))
    .update(addMessage(msg))

  return updateChannel(state, channelId, channel)
}

export let onUpdateAddHtlc = (state, msg) => {
  let channel = getChannel(state, msg.channelId)
    .update(increment(remotePaymentIndexPath))
    .update(increment(localUpdateCounterPath))
    .update(s => addWrapper(s, 'local', 'local', ChannelUpdateTypes.ADD, Direction.RECEIVED, msg))

  // TODO check index
  // assert.deepEqual(msg.id, channel.remote.indexes.inU.add(1))
  // TODO check amount
  // TODO go through staged payments and calculate there are enough funds

  return updateChannel(state, msg.channelId, channel)
}

export function createCommitmentSigned (channelId, state) {
  let channel = getChannel(state, channelId)
  let channelState = channel.get('remote')

  let channelStateComm = channelState
    .update(s => applyWrapperList(channelState.get('ack'), s))
    .update(s => applyWrapperList(channelState.get('unack'), s))

  let paymentList = channelStateComm.get('committed')
  // TODO prune payment list
  // TODO create commitment transaction
  // TODO sign commitment transaction
  // TODO sign payment transactions

  let msg = CommitmentSigned(channelId, null, 0, null)

  channel = channel
    .update(setter(remoteCommitIndexPath, remoteUpdateCounterPath))
    .update(addMessage(msg))
  return updateChannel(state, channelId, channel)
}

export function onCommitmentSigned (state, msg) {
  let channel = getChannel(state, msg.channelId)
  let channelState = channel.get('local')
  // We received a commitment message from the other party
  // We need to apply all the local diffs

  let channelStateComm = channelState
    .update(s => applyWrapperList(channelState.get('ack'), s))
    .update(s => applyWrapperList(channelState.get('unack'), s))

  let paymentList = channelStateComm.get('committed')
  // TODO create commitment transaction
  // TODO check commitment signature

  channel = channel
    .update(setter(localCommitIndexPath, localUpdateCounterPath))

  return updateChannel(state, msg.channelId, channel)
}

export function createRevokeAck (state, channelId) {
  let channel = getChannel(state, channelId)

  // TODO revocation secrets
  let msg = RevokeAndAck(channelId, null, null)

  // We are permanently committing to the new state by revoking the old state
  // After sending this message, the comm list will be merged to the committed list
  // This message also serves as an ack message for all the staged updates, such that
  // we can safely merge them into our counterparties ack list.
  let channelState = channel.get('local')
    .update(s => applyWrapperList(s.get('ack'), s))
    .update(s => applyWrapperList(s.get('unack'), s))

  // We also need to copy the local unack list
  let commitIndex = channelState.get('commitIndex')
  let filter = a => a.get('index').lte(commitIndex)

  let updatesToCommit = channelState
    .get('unack')
    .filter(filter)
    .map(reverseWrapper)

  channel = channel
    .set('local', channelState)
    .updateIn(['remote', 'ack'], a => a.push(...updatesToCommit))
    .updateIn(['local', 'unack'], a => a.filterNot(filter))
    .setIn(['local', 'ack'], List())
    .update(addMessage(msg))

  return updateChannel(state, channelId, channel)
}

export function onRevokeAck (state, msg) {
  let channel = getChannel(state, msg.channelId)

  // TODO check commitments and compact our commitment store

  let channelState = channel.get('remote')
    .update(s => applyWrapperList(s.get('ack'), s))
    .update(s => applyWrapperList(s.get('unack'), s))

  // We also need to copy the remote unack list
  let commitIndex = channelState.get('commitIndex')
  let filter = a => a.get('index').lte(commitIndex)

  let updatesToCommit = channelState.get('unack').filter(filter)
  channel = channel
    .set('remote', channelState)
    .updateIn(['local', 'ack'], a => a.push(...updatesToCommit))
    .updateIn(['remote', 'unack'], a => a.filterNot(filter))
    .setIn(['remote', 'ack'], List())
    .update(addMessage(msg))

  return updateChannel(state, msg.channelId, channel)
}
