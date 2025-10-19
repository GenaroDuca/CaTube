import { forwardRef } from 'react';

const Container = forwardRef((props, ref) => {
    return (
        <div className={props.className} ref={ref}> {props.children}</div>
    );
});

export default Container;