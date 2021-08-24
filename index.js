#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const downloadGitRep = require("download-git-repo");
const inquirer = require("inquirer");
const handlebars = require("handlebars");
const { exec } = require("child_process");
const fs = require("fs");
const ora = require("ora");
const chalk = require("chalk");
const open = require('open');

const templateList = {
  react: {
    name: "react",
    desc: "基于egg+react通用项目模板",
    downloadUrl: "https://gitee.com:debingfeng/cc-cli-egg-react#master",
    url: "https://gitee.com/debingfeng/cc-cli-egg-react",
    config: "",
    tpl: "",
    
  },
  vue: {
    name: "egg-vue",
    desc: "基于egg+vue通用项目模板",
    downloadUrl: "https://gitee.com:debingfeng/cc-cli-egg-vue#master",
    url: "https://gitee.com/debingfeng/cc-cli-egg-vue"
  },
  web: {
    name: "webapp",
    desc: "基于gulp构建的通用纯webapp模板",
    downloadUrl: "https://gitee.com:debingfeng/webapp#master",
    url: "https://gitee.com/debingfeng/webapp"
  }
};

program.version("0.0.1");
// .option('-c, --config <path>', 'set config path', './deploy.conf');

program
  .command("create [template-name] [project-name]")
  .description("初始化项目模板")
  .option("-t, --template", "请选择选择模板名称", "react")
  .option("-p, --project", "你的项目名称", `demo${Date.now()}`)
  .action((templateName, projectName) => {
    console.log("templateName", templateName);
    console.log("projectName", projectName);
    // 获取用户输入信息
    getUserInput().then((answers) => {
      const { downloadUrl } = templateList[templateName];
      const spinner = ora();
      spinner.start("下载模板中");

      downloadGitRep(downloadUrl, projectName, { clone: true }, (err) => {
        if (err) {
          spinner.fail("下载失败");
          return;
        }
        spinner.succeed("下载成功");

        const pkPath = `${projectName}/package.json`;
        const pkFile = fs.readFileSync(pkPath, "utf-8");
        const pkResult = handlebars.compile(pkFile)(answers);
        fs.writeFileSync(pkPath, pkResult);

        const cmdStr = `
          cd ${projectName};
          yarn install
        `;
        spinner.start("安装依赖中");
        exec(cmdStr, (error, stdout, stderr) => {
          if (error) {
            return spinner.fail("安装依赖失败");
          }
          spinner.succeed("安装完成");
          console.log(chalk.green("   你可以执行以下命令来启动你的应用："));
          console.log(chalk.green(`   cd ${projectName}`));
          console.log(chalk.green("   yarn start"));
        });
      });
    });

    // 根据参数来创建目录和引入模板
  });

program
  .command("list")
  .description("查看模板列表")
  .action(() => {
    let str = "";
    // 只需要打印模板列表
    Object.keys(templateList).forEach((key, index) => {
      str += "    \n";
      str += `    ${index + 1}. ${key}: ${templateList[key].desc} \n`;
      str += "    ";
    });

    console.log(chalk.blueBright(str));

    // 根据参数来创建目录和引入模板
  });

program
  .command("ui")
  .description("可视化项目管理操作")
  .action(() => {
    const cmdStr = `yarn ui:dev`;
    const spinner = ora();
    spinner.start('启动服务中')
    // exec(cmdStr, (error, stdout, stderr) => {
    //   console.log('xxxxxx');
    //   if (error) {
    //     return spinner.fail("启动服务失败");
    //   }
      
    //   spinner.success('启动完成')
    //   console.log(chalk.green('启动成功'))
    // });
    open('http://localhost:9102')

    // 根据参数来创建目录和引入模板
  });

program.parse(process.argv);

/**
 * 获取用户输入参数
 */
function getUserInput() {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        /* Pass your questions in here */
        {
          type: "input",
          name: "name",
          message: "请输入项目名称"
          // default: ''，
          // validate: () => {},
          // filter: () => {}
        },
        {
          type: "input",
          name: "author",
          message: "请输入作者名称"
          // default: ''，
          // validate: () => {},
          // filter: () => {}
        }
      ])
      .then((answers) => {
        // Use user feedback for... whatever!!
        console.log(answers);
        resolve(answers);
      })
      .catch((error) => {
        reject(error);
      });
  });
}