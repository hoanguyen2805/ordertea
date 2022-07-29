import React, {useState} from 'react';
import {withFormsy} from 'formsy-react';
import {addValidationRule} from 'formsy-react';

addValidationRule('isRequired', function (values,value) {
    return value?.length > 0;
});

addValidationRule('isConfirm', function (values,value, field) {

    return value?.length > 0 && value===values[field];
});
FormInput.propTypes = {};

function FormInput(props) {

    const [showPass,setShowPass] = useState(!props?.isPassword);

    const changeValue = (event) => {
        props.setValue(event.currentTarget.value);
    }

    const switchEye = () => {
        return <div className="password-toggle" onClick={e => setShowPass(!showPass)} style={{ left: 'auto', right: '0px', top: '50%', transform: 'translate(-50%, -50%)' }}>
            {showPass ? <i className="fa-solid fa-eye" style={{fontSize:'12px'}}></i> : <i className="fa-solid fa-eye-slash"></i>}
        </div>

    }
    return (
        <div style={{display: 'flex', flexDirection: 'column', position: "relative", width: '240px'}}>
            <input readOnly={props?.readOnly||false}  type={!showPass?"password":props.type||"text"} onChange={e => changeValue(e)}  value={props?.value || ''} className={props?.className || ''} {...props}/>
            {props?.isPassword && switchEye()}
            <span style={{
                fontSize: '12px',
                color: 'red',
                position: 'relative',
                height: 0,
            }}>{props?.errorMessage || ''}</span>
        </div>
    );
}

export default withFormsy(FormInput);