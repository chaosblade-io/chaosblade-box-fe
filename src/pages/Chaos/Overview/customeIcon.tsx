import React, { FC, memo } from 'react';

const fileSvg = <img src='https://img.alicdn.com/imgextra/i3/O1CN01s3R98O26V4vajD1l3_!!6000000007666-55-tps-18-18.svg' />;

const star1Svg = <img src='https://img.alicdn.com/imgextra/i2/O1CN017BS86g1lCCfyDf7l7_!!6000000004782-55-tps-20-20.svg' />;

const star2Svg = <img src='https://img.alicdn.com/imgextra/i2/O1CN01miWzid1zTWGov4i01_!!6000000006715-55-tps-20-20.svg' />;

const star3Svg = <img src='https://img.alicdn.com/imgextra/i3/O1CN01tj5GkV1aWOMITb1AQ_!!6000000003337-55-tps-20-20.svg' />;

const ladeSvg = <img src='https://img.alicdn.com/imgextra/i3/O1CN01Aoh3qY1YSbrBT6A2T_!!6000000003058-55-tps-18-18.svg' />;

const litmusSvg = <img src='https://img.alicdn.com/imgextra/i2/O1CN01xbtVVv1oj7zbOVSfe_!!6000000005260-55-tps-18-18.svg' />;

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
