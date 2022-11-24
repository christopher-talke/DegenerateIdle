import * as dotenv from 'dotenv';
dotenv.config();

import './discord/bot';
import './plugins/enabled';

// @ts-ignore
BigInt.prototype.toJSON = function (): number {
    return Number(this);
};