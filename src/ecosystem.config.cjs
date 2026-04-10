module.exports = {
    apps: [
        {
            name: "restapi4001",
            script: "index.js",
            env: {
                PORT: 4001
            }
        },
        {
            name: "restapi4002",
            script: "index.js",
            env: {
                PORT: 4002
            }
        }
    ]
}
