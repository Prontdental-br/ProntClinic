import { useEffect } from 'react';
import DialogReceipt from "src/views/pages/odontogram/DialogReceipt";
import OdontogramCardReceipt from "src/views/pages/odontogram/OdontogramCardReceipt";

function PrintPage(){
    
    useEffect(function(){
        setTimeout(function(){
            window.print();
        }, 100)
    },[])

    return(
        <OdontogramCardReceipt showPrintButton={false}/>
    )
}

export default PrintPage;