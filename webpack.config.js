const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

module.exports = function(env, argv) {
	const dev = (argv.mode === 'development')
	const prod = !dev
	const minimize = prod
	const sourceMap = dev
	const cssLoaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: dev,
			},
		},
		{
			loader: 'css-loader',
			options: {
				importLoaders: 1,
				camelCase: true,
				sourceMap: sourceMap
			}
		},
		{
			loader: 'postcss-loader',
			options: {
				plugins: (loader) => [
					require('autoprefixer')({
						overrideBrowserslist: ['last 2 versions']
					})
				],
				sourceMap: sourceMap
			}
		}
	]
	const sassLoader = {
		loader: 'sass-loader',
		options: {
			sourceMap: sourceMap
		}
	}
	const jsLoader = {
		loader: 'babel-loader',
		options: {
			presets: ['@babel/preset-env']
		}
	}
	const fileLoader = {
		loader: 'file-loader',
		options: {
			name(file) {
				return 'img/[name].[ext]'
			}
		}
	}
	return {
		mode: argv.mode,
		entry: {
			app: ['./src/docs/ts/App.ts']
		},
		output: {
			path: __dirname + '/dist',
			filename: (dev ? '[name].min.js' : '[name].[contenthash].min.js'),
			sourceMapFilename: (dev ? '[name].js.map' : '[name].[contenthash].js.map'),
			hotUpdateChunkFilename: 'hot/hot-update.js',
			hotUpdateMainFilename: 'hot/hot-update.json'
		},
		watch: dev,
		devtool: 'inline-source-map',
		devServer: {
			contentBase: './dist'
		},
		resolve: {
			modules: [path.resolve(__dirname, 'src'), 'node_modules'],
			extensions: ['.css', '.sass', '.scss', '.js', '.jsx', '.ts', '.tsx', '.json', '.png', '.svg', '.jpg', '.jpeg', '.gif', '.txt']
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: cssLoaders
				},
				{
					test: /\.s(a|c)ss$/i,
					use: [...cssLoaders, sassLoader]
				},
				{
					test: /\.jsx?$/i,
					use: jsLoader
				},
				{
					test: /\.tsx?$/i,
					use: [jsLoader, 'ts-loader']
				},
				{
					test: /\.(png|svg|jpe?g|gif)$/i,
					use: fileLoader
				},
				{
					test: /\.txt$/i,
					use: 'raw-loader'
				}
			]
		},
		plugins: [
			new CleanWebpackPlugin(),
			new HtmlWebpackPlugin({
				filename: (dev ? 'index.html' : '../index.html'),
				template: 'src/docs/index.html',
				minify: minimize,
				cache: true,
				showErrors: dev
			}),
			new MiniCssExtractPlugin({
				filename: (dev ? '[name].min.css' : '[name].[contenthash].min.css'),
				chunkFilename: (dev ? '[id].min.css' : '[id].[contenthash].min.css'),
				disable: dev
			}),
			new OptimizeCssnanoPlugin({
				cssnanoOptions: {
					preset: ['default', {
						discardComments: {
							removeAll: true,
						},
					}],
				},
			}),
			new UglifyJsPlugin({
				test: /\.js($|\?)/i,
				sourceMap: sourceMap,
				cache: true,
				parallel: true
			})
		]
	}
}
