import * as React from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormRadioGroupProps {
  /** 그룹 라벨 */
  label?: string;
  /** 라디오 name 속성 (react-hook-form register name) */
  name: string;
  /** 선택지 목록 */
  options: RadioOption[];
  /** 에러 메시지 */
  error?: string;
  /** 현재 선택 값 */
  value?: string;
  /** 수평/수직 배치 */
  orientation?: 'horizontal' | 'vertical';
  /** 비활성화 */
  disabled?: boolean;
  /** RHF onChange */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** RHF onBlur */
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const FormRadioGroup = React.forwardRef<HTMLInputElement, FormRadioGroupProps>(
  ({ label, name, options, error, value, orientation = 'vertical', disabled, onChange, onBlur }, ref) => {
    return (
      <fieldset className="space-y-1.5" disabled={disabled}>
        {label && (
          <legend className="text-sm font-medium text-foreground">{label}</legend>
        )}
        <div
          className={cn(
            'flex gap-3',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          )}
          role="radiogroup"
        >
          {options.map((opt, idx) => {
            const radioId = `${name}-${opt.value}`;
            return (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  ref={idx === 0 ? ref : undefined}
                  id={radioId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={value === opt.value}
                  disabled={opt.disabled}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={cn(
                    'h-4 w-4 appearance-none rounded-full border border-input ring-offset-background',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'checked:border-[5px] checked:border-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-destructive',
                  )}
                />
                <label
                  htmlFor={radioId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {opt.label}
                </label>
              </div>
            );
          })}
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </fieldset>
    );
  },
);
FormRadioGroup.displayName = 'FormRadioGroup';

export { FormRadioGroup };
