import chalk from "chalk";
import * as GitHub from "github-api";
import * as prompt from "prompt";
import * as Table from "cli-table";
import * as ora from "ora";

const search = (new GitHub()).search();


(
    async () => {
        const language = await askForLanguage();

        const spinner = ora(chalk.green(`Searching for high-starred ${language} repos`)).start();
        let repos;
        try {
            repos = await search.forRepositories({
                q:    `language:${language}`,
                sort: "stars",
            });
        } catch (e) {
            spinner.fail("There was an error communicating with the GitHub API");
            process.exit(1);

            return;
        }
        const firstFive = repos.data.splice(0, 5);
        spinner.succed();

        const table = new Table({head: ["Name", "Description", "Stars"]});
        firstFive.forEach(x => {
            table.push([x.full_name, x.description, x.stargazers_count])
        });

        console.log("\n\n" + table.toString());
    }
)();

async function askForLanguage() {
    return new Promise((resolve, reject) => {
        prompt.message   = chalk.yellow("Question");
        prompt.delimiter = chalk.yellow(":");

        prompt.start();

        prompt.get({
            properties: {
                language: {
                    description: chalk.blue(" What language would you like to see?"),
                    required:    true,
                }
            }
        }, (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result.language);
        })
    })
}
