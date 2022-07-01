import React, {useEffect} from 'react';
import './loading.css'

Loading.propTypes = {};

function Loading(props) {
    const type = props?.type || 2;

    useEffect(() => {
        document.getElementsByTagName("body")[0].style.overflow = 'hidden';
        return (() => {
            document.getElementsByTagName("body")[0].style.overflow = 'overlay'
        })
    })
    return (
        <div className="loading-container">
            {props?.backdrop && <div className={"overlay-container"}></div>}
            <div id="loading-content">

                {type === 2 && <div id={`loading-2`}></div>}
                {type === 1 && <div id={"loading-1"} className="load">

                    <div className="fingers">
                        <div className="nails"></div>
                    </div>

                    <div className="fingers">
                        <div className="nails"></div>
                    </div>

                    <div className="fingers">
                        <div className="nails"></div>
                    </div>

                    <div className="fingers">
                        <div className="nails"></div>
                    </div>

                    <div className="pollex"></div>

                </div>}
                {props?.info && <div className={"text-info"} id="loading-info">{props.info}</div>}
            </div>

        </div>
    );
}

export default Loading;