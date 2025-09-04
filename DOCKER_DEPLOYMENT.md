# Docker 部署说明

本项目使用 Docker 和 Docker Compose 进行部署，包含前端、后端和数据库三个服务。

## 文件说明

-   `docker-compose.yml` - Docker Compose 配置文件，定义了所有服务
-   `packages/backend/Dockerfile` - 后端 Docker 镜像构建文件
-   `packages/frontend/Dockerfile` - 前端 Docker 镜像构建文件
-   `packages/frontend/nginx.conf` - Nginx 配置文件，用于前端静态文件服务和 API 代理
-   `.dockerignore` - Docker 构建时忽略的文件

## 服务架构

### 1. PostgreSQL 数据库 (postgres)

-   镜像: `postgres:15-alpine`
-   端口: `5432`
-   数据持久化: `postgres_data` 卷
-   环境变量:
    -   `POSTGRES_DB`: hash_dict
    -   `POSTGRES_USER`: hash_dict_user
    -   `POSTGRES_PASSWORD`: hash_dict_password

### 2. 后端服务 (backend)

-   构建: 使用分阶段构建，先构建整个项目，再复制必要文件
-   端口: `3000`
-   环境变量:
    -   `POSTGRES_HOST`: postgres
    -   `POSTGRES_PORT`: 5432
    -   `POSTGRES_DATABASE`: hash_dict
    -   `POSTGRES_USER`: hash_dict_user
    -   `POSTGRES_PASSWORD`: hash_dict_password
    -   `NODE_ENV`: production

### 3. 前端服务 (frontend)

-   构建: 使用分阶段构建，构建静态文件后使用 Nginx 提供服务
-   端口: `80`
-   API 代理: `/api` 路径的请求转发到后端服务
-   静态文件缓存: 优化了静态资源的缓存策略

## 部署步骤

### 1. 构建并启动所有服务

```bash
docker-compose up -d
```

### 2. 查看服务状态

```bash
docker-compose ps
```

### 3. 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### 4. 停止服务

```bash
docker-compose down
```

### 5. 停止服务并删除数据卷

```bash
docker-compose down -v
```

## 访问方式

-   前端应用: http://localhost
-   后端 API: http://localhost/api (通过 Nginx 代理)
-   直接访问后端: http://localhost:3000
-   PostgreSQL 数据库: localhost:5432

## 开发模式

如果需要重新构建镜像（代码更新后）：

```bash
# 重新构建并启动
docker-compose up -d --build

# 仅重新构建特定服务
docker-compose build backend
docker-compose build frontend
```

## 生产环境配置建议

1. **安全性**:

    - 修改默认的数据库密码
    - 设置更强的密码策略
    - 配置防火墙规则

2. **性能优化**:

    - 根据实际需求调整容器资源限制
    - 配置数据库连接池
    - 启用 Nginx 的 gzip 压缩（已配置）

3. **监控和日志**:

    - 配置日志轮转
    - 添加监控和告警系统
    - 配置健康检查（已包含基本健康检查）

4. **备份**:
    - 定期备份 PostgreSQL 数据
    - 配置数据卷的备份策略

## 故障排除

1. **端口冲突**: 如果本地已有服务占用 80 或 3000 端口，修改 docker-compose.yml 中的端口映射
2. **权限问题**: 确保 Docker 有足够的权限访问项目目录
3. **内存不足**: 构建过程需要足够的内存，如果构建失败可能需要增加 Docker 的内存限制
4. **网络问题**: 确保容器间可以正常通信，检查 Docker 网络配置

## 环境变量说明

后端服务支持以下环境变量（来自 `packages/backend/src/db/index.ts`）：

-   `POSTGRES_HOST` - PostgreSQL 主机地址
-   `POSTGRES_PORT` - PostgreSQL 端口
-   `POSTGRES_DATABASE` - 数据库名称
-   `POSTGRES_USER` - 数据库用户名
-   `POSTGRES_PASSWORD` - 数据库密码
-   `SQLITE_DB_FILE` - SQLite 数据库文件路径（当不使用 PostgreSQL 时）
