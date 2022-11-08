import chalk from 'chalk';
import { getCurrentTimestamp } from '@utils';

const now = getCurrentTimestamp;

const logger = {
    info: function (msg: any) {
        console.info(chalk.blue(`${now()} :::: INFO :::: ${msg}`));
    },
    section: function (msg: any) {
        console.info(chalk.bgGreenBright(`${now()} :::: SECTION :::: ${msg}`));
    },
    debug: function (msg: any) {
        console.debug(chalk.white(`${now()} :::: DEBUG :::: ${msg}`));
    },
    warn: function (msg: any) {
        console.warn(chalk.yellow(`${now()} :::: WARN :::: ${msg}`));
    },
    error: function (msg: any) {
        console.error(chalk.bgRedBright(`${now()} :::: ERROR :::: ${msg}`));
    },
};

export default logger;
