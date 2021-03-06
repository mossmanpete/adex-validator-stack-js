const BN = require('bn.js')
const cfg = require('../../../cfg')
const HEALTH_THRESHOLD = new BN(cfg.HEALTH_THRESHOLD_PROMILLES)
const ZERO = new BN(0)

// Implements constraints described at: https://github.com/AdExNetwork/adex-protocol/blob/master/OUTPACE.md#specification
function isValidTransition(channel, prev, next) {
	const sumPrev = sumMap(prev)
	const sumNext = sumMap(next)
	return sumNext.gte(sumPrev)
		&& sumNext.lte(new BN(channel.depositAmount))
		&& Object.entries(prev).every(([acc, bal]) => {
			const nextBal = next[acc]
			if (!nextBal) return false
			return nextBal.gte(bal)
		})
		&& Object.entries(next).every(([acc, bal]) => !bal.isNeg())
}

function isHealthy(our, approved) {
	const sumOur = sumMap(our)
	const sumApprovedMins = sumMins(our, approved)
	// division by zero can't happen here, because sumApproved >= sumOur
	// if sumOur is 0, it will always be true
	if (sumApprovedMins.gte(sumOur)) {
		return true
	}
	if (sumApprovedMins.mul(new BN(1000)).div(sumOur).lt(HEALTH_THRESHOLD)) {
		return false
	}
	return true
}

function sumBNs(bns) {
	return bns.reduce((a,b) => a.add(b), ZERO)
}

function sumMap(all) {
	return sumBNs(Object.values(all))
}

function sumMins(our, approved) {
	// since the min(anything, non existant val) is always 0, we need to sum the mins of the intersecting keys only
	// for this, it's sufficient to iterate the keys of whichever map
	return sumBNs(Object.keys(our)
		.map(k => BN.min(our[k], approved[k] || ZERO))
	)
}

function getStateRootHash(channel, balances, adapter){
	// Note: MerkleTree takes care of deduplicating and sorting
	const elems = Object.keys(balances).map(
		acc => adapter.getBalanceLeaf(acc, balances[acc])
	)
	const tree = new adapter.MerkleTree(elems)
	const balanceRoot = tree.getRoot()
	// keccak256(channelId, balanceRoot)
	const stateRoot = adapter.getSignableStateRoot(Buffer.from(channel.id), balanceRoot).toString('hex')
	return stateRoot
}

function isValidRootHash(leaderRootHash, { channel, balances, adapter }) {
	return getStateRootHash(channel, balances, adapter) === leaderRootHash
}


module.exports = { isValidTransition, isHealthy, isValidRootHash, getStateRootHash }
