import FileSvg from '../../../imgs/fileSvg.svg';
import LadeSvg from '../../../imgs/ladeSvg.svg';
import LitmusSvg from '../../../imgs/litmusSvg.svg';
import React, { FC, memo } from 'react';
import Start1 from '../../../imgs/start1.svg';
import Start2 from '../../../imgs/start2.svg';
import Start3 from '../../../imgs/start3.svg';


const fileSvg = <img src={FileSvg} />;

const star1Svg = <img src={Start1} />;

const star2Svg = <img src={Start2} />;

const star3Svg = <img src={Start3} />;

const ladeSvg = <img src={LadeSvg}/>;

const litmusSvg = <img src={LitmusSvg} />;

interface Props {
  type: string;
}
const svgIcon: FC<Props> = props => {
  const { type } = props;
  let icon: any = null;
  switch (type) {
    case 'file':
      icon = fileSvg;
      break;
    case 'star1':
      icon = star1Svg;
      break;
    case 'star2':
      icon = star2Svg;
      break;
    case 'star3':
      icon = star3Svg;
      break;
    case 'lade':
      icon = ladeSvg;
      break;
    case 'litmus':
      icon = litmusSvg;
      break;
    default:
      break;
  }
  return <i className="next-icon next-medium">{icon}</i>;
};
export default memo(svgIcon);
