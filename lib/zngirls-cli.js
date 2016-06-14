import { Girl } from './girl';

Girl.load('19702')
  .tap(girl => console.log(girl.toJSONString()))
  .tap(girl => console.log(girl.bwh));
