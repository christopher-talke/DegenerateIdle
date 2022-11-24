import chalk from 'chalk';
import { getCurrentTimestamp } from './utilities';

const now = getCurrentTimestamp;

const logger = {
    info: function (msg: string) {
        console.info(chalk.blue(`${now()} :::: INFO :::: ${msg}`));
    },
    section: function (msg: string) {
        console.info(chalk.bgGreenBright(`${now()} :::: SECTION :::: ${msg}`));
    },
    debug: function (msg: string) {
        console.debug(chalk.white(`${now()} :::: DEBUG :::: ${msg}`));
    },
    warn: function (msg: string) {
        console.warn(chalk.yellow(`${now()} :::: WARN :::: ${msg}`));
    },
    error: function (msg: string) {
        console.error(chalk.bgRedBright(`${now()} :::: ERROR :::: ${msg}`));
    },
};

export default logger;
