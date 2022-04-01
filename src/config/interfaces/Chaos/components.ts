
export interface ITextInputProps {
  type?: string;
  htmlType: string;
  iconTip?: string;
  icon?: string;
  maxLength?: number;
  textbefore?: string;
  autoheight?: boolean;
  onChange: (value: string) => void;
  onClickIcon?: () => void;
  labelPlacement?: string;
  direction: string;
  value: string;
  placeholder?: string;
  label: string;
  textBefore?: string;
  required: boolean;
  disabled: boolean;
  defaultValue: string;
  autoHeight?: any;
  wrapperStyle: any;
  labelStyle: any;
  tip: string;
  errorMessage: string;
  hasClear?: boolean;
  className?: any;
  alias?: string;
}

export interface IInputProps {
  hasClear?: boolean;
  disabled: boolean;
  value: string;
  placeholder: string;
  defaultValue: string;
  maxLength: number;
  autoheight: number;
  textbefore: string;
  onChange: (value: string) => void;
}

export interface ILabel {
  label: string;
  value: string;
}
