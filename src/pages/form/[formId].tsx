import React from 'react';
import {GetServerSideProps} from 'next';
import {PublicFormService, FormWithData} from 'src/lib/services/FormService';
import {db} from 'src/lib/db';
import Form from "@rjsf/core";
import {ErrorInfo, getErrorInfo, isErrorInfo} from '../../lib/client_utils';
import Error from 'next/error';

type FormPageProps = {
    data: FormWithData | ErrorInfo;
}

export default function FormPage(props: FormPageProps) {
    if (isErrorInfo(props.data)) {
        return <Error statusCode={props.data.code} title={props.data.msg}/>
    }

    return <div>
        <div>
            Here goes the preview
        </div>
        <div>
            <Form schema={props.data.schema}
                formData={props.data.data} />
        </div>
    </div>
}

export const getServerSideProps: GetServerSideProps<FormPageProps> = async context => {

    console.log(context);

    const service = new PublicFormService(db);
    try {
        const data = await service.getForm(context.params.formId as string);

        return {
            props: {
                data
            }
        };
    } catch (ai) {
        return {
            props: {
                data: getErrorInfo(ai)
            }
        }
    }
}

