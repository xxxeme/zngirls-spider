import { Girl } from './girl';
import { dumpGirl } from './file-system';

const girl = new Girl(19702);
girl.toJSONString().then(console.log);
girl.bwh.then(console.log);
dumpGirl(girl);
