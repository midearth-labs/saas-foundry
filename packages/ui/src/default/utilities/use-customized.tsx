import React from 'react';

export interface CustomComponents {
  topSection?: React.ReactNode;
  bottomSection?: React.ReactNode;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

// TODO: Add React.memo to the component
// Customization HOC
export function useCustomized<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return React.memo(function (props: P & CustomComponents) {
    const {
      topSection,
      bottomSection,
      leftSection,
      rightSection,
      topContent,
      bottomContent,
      ...componentProps
    } = props;

    return (
      <div className="relative w-full">
        {topSection && (
          <div className="mb-4">{topSection}</div>
        )}
        <div className="flex gap-4">
          {leftSection && (
            <div className="w-64">{leftSection}</div>
          )}
          <div className="flex-1">
            {topContent && (
              <div className="mb-4">{topContent}</div>
            )}
            <WrappedComponent {...(componentProps as P)} />
            {bottomContent && (
              <div className="mt-4">{bottomContent}</div>
            )}
          </div>
          {rightSection && (
            <div className="w-64">{rightSection}</div>
          )}
        </div>
        {bottomSection && (
          <div className="mt-4">{bottomSection}</div>
        )}
      </div>
    );
  });
}
