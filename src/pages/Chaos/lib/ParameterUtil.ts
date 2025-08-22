import * as _ from 'lodash';
import i18n from '../../../i18n';
import { FunctionParameterConstants } from 'config/constants/Chaos/FunctionParameterConstants';
import { IArgs, INode } from 'config/interfaces/Chaos/experiment';


const checkNodesArgs = function(nodes: INode[]) {
  const checkFailedNodes: any[] = [];
  if (nodes) {
    _.forEach(nodes, (node: INode) => {
      // 只判断args就够了，无论是新增还是编辑态，args会第一时间赋上值
      let args = node.args;
      if (_.isEmpty(args)) {
        args = node.arguments;
      }
      let allParams: any = [];
      for (const item of args) {
        const { argumentList } = item as any;
        allParams = allParams.concat(argumentList);
      }
      let foundError = false;
      if (!_.isEmpty(args)) {
        for (const item of args) {
          const { argumentList } = item as any;
          for (const arg of argumentList) {
            const { component, value } = arg;
            if (!_.isEmpty(component)) {
              const { required, constraint, type } = component;
              // 必填校验
              if (required) {
                if (value == null || value === '') {
                  foundError = true;
                  if (type === FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT_REMOTE ||
                    type === FunctionParameterConstants.PARAMETER_COMPONENT_TYPE_SELECT
                  ) {
                    arg.errorMessage = i18n.t('Required, please select');
                  } else {
                    arg.errorMessage = i18n.t('Required, please enter the content');
                  }
                  continue;
                } else {
                  if (arg && arg.errorMessage) {
                    // 校验通过，清空errorMessage
                    arg.errorMessage = '';
                  }
                }
              }
              if (constraint && !_.isEmpty(constraint)) {
                const { range, checkerTemplate } = constraint;
                if (!_.isEmpty(range) && !_.isEmpty(checkerTemplate)) {
                  // 关联参数与被关联参数都需要加以校验
                  const rangeArgs = _.concat(arg, _.filter(allParams, ({ alias }: IArgs) => _.find(range, (aliasName: string) => aliasName === alias)));
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const checker = this[checkerTemplate];
                  if (!_.isEmpty(rangeArgs) && checker) {
                    const { error } = checker(...rangeArgs);
                    if (error) {
                      foundError = true;
                      continue;
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (foundError) {
        node.argsValid = false;
        checkFailedNodes.push(node);
      } else {
        node.argsValid = true;
      }
    });
  }
  return checkFailedNodes;
};

// 两者互斥：两个参数的值类型必须为boolean，且取值相反。
const opposite = function(...args: IArgs[]) {
  const arg1 = args[0];
  const arg2 = args[1];

  // 如果其中有1个值未选，则校验通过
  if (arg1.value == null || arg2.value == null) {
    return { error: false, args };
  }

  // 值类型必须是boolean
  // 如果两者的值正好相反，则校验通过
  const value1 = arg1.value === 'true'; // value可能是String类型："true", "false"
  const value2 = arg2.value === 'true';
  if (value1 === !value2) {
    return { error: false, args };
  }

  arg1.errorMessage = `${i18n.t('Must match the parameter')}<${arg2.name}>${i18n.t('Opposite value')}`;
  arg2.errorMessage = `${i18n.t('Must match the parameter')}<${arg1.name}>${i18n.t('Opposite value')}`;
  return { error: true, args };
};

// N选一，N个参数只能选1个填写
const one_only = function(...args: IArgs[]) {
  const hasValueArgs = _.filter(args, ({ component: { type }, value }: IArgs) => {
    // type为radio时，value不为空，是string状态的boolean，理论上就是一个不为空的string，!!value不能作为判定依据，单独处理
    if (type === 'radio') {
      return value === 'true';
    }
    return !!value;
  });
  // 符合预期
  if (hasValueArgs.length === 1) {
    for (const arg of args) {
      arg.errorMessage = '';
    }
    return { error: false, args };
  }

  // 其他情况都不符合预期
  for (const arg of args) {
    const otherArgs = _.filter(args, (a: IArgs) => a !== arg);
    arg.errorMessage = `${i18n.t('With parameters')}${_.map(otherArgs, ({ name }: IArgs) => `<${name}>`).join('、')}${args.length}${i18n.t('Choose 1 to fill in')}!`;
  }
  return { error: true, args };
};

export default {
  checkNodesArgs,
  opposite,
  one_only,
};
