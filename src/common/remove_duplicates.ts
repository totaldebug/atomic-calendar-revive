export function removeDuplicates(dayEvents) {
	return dayEvents.filter(
		(
			(temp) => (a) =>
				((k) => !temp[k] && (temp[k] = true))(a.summary + '|' + a.startTime + '|' + a.endTime)
		)(Object.create(null)),
	);
}
