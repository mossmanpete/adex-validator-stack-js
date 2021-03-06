module.exports = {
	MAX_CHANNELS: 512,
	SNOOZE_TIME: 1000,
	WAIT_TIME: 500,
	AGGR_THROTTLE: 5000,
	CHANNELS_FIND_LIMIT: 100,
	EVENTS_FIND_LIMIT: 10,
	MSGS_FIND_LIMIT: 10,
	HEALTH_THRESHOLD_PROMILLES: 950,
	// This generally depends on (SNOOZE_TIME+WAIT_TIME)/AGGR_THROTTLE
	// but it's way more, in order to allow for the possibility of the validator worker crashing
	PRODUCER_MAX_AGGR_PER_TICK: 100,
}
