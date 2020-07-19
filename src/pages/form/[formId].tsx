import React from 'react';
import {GetServerSideProps} from 'next';
import {FormWithData, PublicFormService} from 'src/lib/services/FormService';
import {db} from 'src/lib/db';
import Form from "@rjsf/core";
import {ErrorInfo, getErrorInfo, getFirst, isErrorInfo} from '../../lib/client_utils';
import Error from 'next/error';
import Head from 'next/head';

type FormPageProps = {
    data: FormWithData | ErrorInfo;
    source?: string;
}

export default function FormPage(props: FormPageProps) {
    if (isErrorInfo(props.data)) {
        return <Error statusCode={props.data.code} title={props.data.msg}/>
    }

    return <>
        <Head>
            <title>{props.data.schema.title || props.data.id}</title>
        </Head>
        <div className="row">
            <div className="col m-3">
                {props.source}
            </div>
            <div className="col m-3">
                <Form schema={props.data.schema}
                      formData={props.data.data}/>
            </div>
        </div>
        <div className="row">
           <div className="col">
               <pre>{JSON.stringify(props.data, null, 2)}</pre>
           </div>
        </div>
    </>
}

export const getServerSideProps: GetServerSideProps<FormPageProps> = async context => {
    const service = new PublicFormService(db);
    try {

        const formId = getFirst(context.params.formId);

        const data = await service.getForm(formId);

        return {
            props: {
                data,
                source: getFirst(context.query.source)
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

