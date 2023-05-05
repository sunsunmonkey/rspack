const { PerfseePlugin } = require("@perfsee/webpack");
/** @type {import('@rspack/cli').Configuration} */
const config = {
	context: __dirname,
	entry: {
		main: "./src/index.js"
	},
	builtins: {
		html: [
			{
				template: "./index.html"
			}
		]
	},
	plugins: [new PerfseePlugin({})]
};
module.exports = config;