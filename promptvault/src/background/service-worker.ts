import ExtPay from 'extpay';
import { EXTENSION_ID } from '../lib/extensionpay';

const extpay = ExtPay(EXTENSION_ID);
extpay.startBackground();
