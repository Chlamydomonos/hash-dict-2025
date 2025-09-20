# 哈希语词典

人造语言——哈希语的词典。已经部署在[hash-dict.chlamydomonos.xyz](https://hash-dict.chlamydomonos.xyz)。

需要**PNPM**作为包管理器。运行`pnpm dev`启动开发服务器，并在浏览器打开`http://localhost:5173`查看网页。

如果需要在开发服务器中启用向量化功能，请手动在电脑上安装 ChromaDB，并启动该数据库，监听 3022 端口。

运行`pnpm release`来生成前后端文件。

项目可以通过 Docker 部署，使用`docker-compose up`直接部署。
