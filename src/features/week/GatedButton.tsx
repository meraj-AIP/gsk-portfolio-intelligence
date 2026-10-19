import Button, { type ButtonProps } from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

type Props = ButtonProps & { allowed: boolean; reason: string };

/** A disabled button swallows pointer events, so the reason sits on a wrapper that can still show it and take focus. */
export function GatedButton({ allowed, reason, disabled, ...rest }: Props) {
  if (allowed) return <Button disabled={disabled} {...rest} />;
  return (
    <Tooltip title={reason}>
      <span tabIndex={0} style={{ display: 'inline-flex' }}>
        <Button {...rest} disabled />
      </span>
    </Tooltip>
  );
}
