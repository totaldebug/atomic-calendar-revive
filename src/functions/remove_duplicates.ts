export function removeDuplicates(dayEvents) {
    const filtered = dayEvents.filter(
        (temp => a =>
            (k => !temp[k] && (temp[k] = true))(a.summary + '|' + a.startTime + '|' + a.endTime)
        )(Object.create(null))
    );
    return filtered
}
