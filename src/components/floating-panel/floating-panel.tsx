import React, {FC} from 'react';
import './floating-panel.scss';
import classNames from "classnames";

export type FloatingPanelProps = {
  padding?: 'none' | 'small' | 'full';
} & React.HTMLAttributes<HTMLDivElement>;

export const FloatingPanel: FC<FloatingPanelProps> = (props) => {

  const className = classNames('floating-panel', {
    'floating-panel-padding-none': props.padding === 'none',
    'floating-panel-padding-small': props.padding === 'small',
    'floating-panel-padding-full': props.padding === 'full',
  }, props.className);

  return (
    <div {...props} className={className}>
      {props.children}
    </div>
  );
}
