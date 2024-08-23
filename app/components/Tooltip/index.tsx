import { useState } from 'react';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import styles from './Tooltip.css';
import type { ReactNode, CSSProperties, ComponentProps } from 'react';

type Props = {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  onClick?: () => void;
  positions?: ComponentProps<typeof Popover>['positions'];
  style?: CSSProperties;
  disabled?: boolean;
};

const Tooltip = ({
  children,
  content,
  className,
  onClick,
  positions,
  style,
  disabled,
}: Props) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={className}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(!disabled && true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Popover
        isOpen={hovered}
        positions={positions}
        content={({ position, childRect, popoverRect }) => (
          <ArrowContainer
            position={position}
            childRect={childRect}
            popoverRect={popoverRect}
            arrowSize={7}
            arrowColor="var(--tooltip-background)"
            arrowClassName={styles.arrow}
          >
            <div className={styles.tooltip}>{content}</div>
          </ArrowContainer>
        )}
      >
        <div>{children}</div>
      </Popover>
    </div>
  );
};

export default Tooltip;
