export default function (userOptions = {}) {
    const files = userOptions.files || [];

    if (files.length === 0) {
        return {
            name: 'ignore',
        }
    }
    return {
        name: 'ignore',

        load(id) {
            return files.some((toIgnorePath) => id.startsWith(toIgnorePath))
                ? {
                    code: '',
                }
                : null;
        },
    };
}
