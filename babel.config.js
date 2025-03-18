const ReactCompilerConfig = {
    target: "19",
};

module.exports = function (api) {
    api.cache(true);

    return {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
    };
};
