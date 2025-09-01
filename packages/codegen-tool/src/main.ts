import fs from 'fs';
import path from 'path';
import mustache from 'mustache';

const packagesPath = path.resolve(__dirname /* dist */, '..' /* codegen-tool */, '..');
const commonLibSrcPath = path.resolve(packagesPath, 'common-lib', 'src');
const commonLibApiPath = path.resolve(commonLibSrcPath, 'api');
const backendApiPath = path.resolve(packagesPath, 'backend', 'src', 'api');
const templatesPath = path.resolve(packagesPath, 'codegen-tool', 'templates');

interface ApiMeta {
    name: string; // 该API文件的名称（转化为PascalCase），如存在文件`common-lib/src/api/a/b/foo-bar.ts`，名称为`ABFooBar`
    path: string; // 该API文件相对`commonLibApiPath`的路径，如存在文件`common-lib/src/api/a/b/foo-bar.ts`，路径为`a/b/foo-bar`
    rootRelativePath: string; // `commonLibSrcPath`相对该文件的路径，如存在文件`common-lib/src/api/a/b/foo-bar.ts`，路径为`../../..`
}

const meta: ApiMeta[] = [];

// 递归扫描目录并生成ApiMeta
const scanApiFiles = (dir: string, relativePath: string = '') => {
    if (!fs.existsSync(dir)) {
        return;
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const currentRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

        if (item.isDirectory()) {
            // 递归扫描子目录
            scanApiFiles(fullPath, currentRelativePath);
        } else if (item.isFile() && item.name.endsWith('.ts')) {
            // 处理TypeScript文件
            const nameWithoutExt = currentRelativePath.replace(/\.ts$/, '');

            // 将路径转换为PascalCase名称
            // 例如: a/b/foo-bar -> ABFooBar
            const name = nameWithoutExt
                .split('/')
                .map((segment) =>
                    segment
                        .split('-')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(''),
                )
                .join('');

            // 计算相对于commonLibSrcPath的路径
            const depth = nameWithoutExt.split('/').length;
            const rootRelativePath = '../'.repeat(depth - 1) + '..';

            meta.push({
                name,
                path: nameWithoutExt,
                rootRelativePath,
            });
        }
    }
};

// 开始扫描
scanApiFiles(commonLibApiPath);

// 读取模板文件
const templatePath = path.join(templatesPath, 'api.ts.mustache');
const template = fs.readFileSync(templatePath, 'utf-8');

// 为每个API元数据生成对应的后端API文件
for (const apiMeta of meta) {
    // 构建目标文件路径
    const targetFilePath = path.join(backendApiPath, `${apiMeta.path}.ts`);

    // 检查目标文件是否已存在，如果存在则跳过
    if (fs.existsSync(targetFilePath)) {
        console.log(`跳过已存在的文件: ${targetFilePath}`);
        continue;
    }

    // 确保目标目录存在
    const targetDir = path.dirname(targetFilePath);
    fs.mkdirSync(targetDir, { recursive: true });

    // 使用mustache替换模板中的变量
    const generatedContent = mustache.render(template, apiMeta);

    // 写入生成的文件
    fs.writeFileSync(targetFilePath, generatedContent, 'utf-8');
    console.log(`生成文件: ${targetFilePath}`);
}

// 生成前端的request.ts文件
const requestTemplatePath = path.join(templatesPath, 'request.ts.mustache');
const requestTemplate = fs.readFileSync(requestTemplatePath, 'utf-8');

// 构建前端目标文件路径
const frontendRequestPath = path.resolve(packagesPath, 'frontend', 'src', 'lib', 'request.ts');

// 确保目标目录存在
const frontendRequestDir = path.dirname(frontendRequestPath);
fs.mkdirSync(frontendRequestDir, { recursive: true });

// 使用mustache替换模板中的变量
const frontendRequestContent = mustache.render(requestTemplate, { meta });

// 写入生成的文件（每次都覆盖）
fs.writeFileSync(frontendRequestPath, frontendRequestContent, 'utf-8');
console.log(`生成文件: ${frontendRequestPath}`);
