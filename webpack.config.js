const path = require('path');
const fs = require('fs');
const ProgressBarPlugin = require('progress-bar-webpack-plugin'); // webpack 编译时显示加载条
const {CleanWebpackPlugin} = require('clean-webpack-plugin'); // 引入clean-webpack-plugin插件，作用是清除 dist 文件及下的内容，因为每次编译完成后都会有一个 dist 文件夹存放静态文件，所以需要清除上次的 dist 文件

// process.cwd(): 当前 Node.js 进程执行时的工作目录
// __disname:当前模块的目录名
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const paths = {
  PUBLIC_PATH: '/',
  appRoot: resolveApp('.'),
  appIndex: resolveApp('src/index.js'),
  appDist: resolveApp('dist'),
};

module.exports = {
  mode: 'production',
  context: paths.appRoot,
  devtool: 'source-map',
  entry: {
    bundle: paths.appIndex
  },
  output: {
    publicPath: paths.PUBLIC_PATH,
    path: paths.appDist,
    // filename: '[name].[hash:8].js',
    filename: '[name].js',
    chunkFilename: '[name].[hash:8].js'
  },
  module: {
    strictExportPresence: true,
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    }],
  },
  plugins: [
    new ProgressBarPlugin(),
    new CleanWebpackPlugin({
      root: paths.appRoot, // 绝对路径，就是要根据这个 root 去找要删除的文件夹，默认是这个 webpack 配置文件所在额
      verbose: true, // 控制台打印日志
      dry: false, // 为 false 是删除文件夹的
      watch: true, // 在编译的时候删除打包文件就是在 npm start 或者 npm run dev，等跑本地服务的时候，删除之前的打包文件
    }),
  ],
  resolve: {
    extensions: ['.js', '.json'],
  },
}