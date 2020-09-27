import React from 'react';
import {GetServerSideProps} from 'next';
import {FormWithData, PublicFormService} from 'src/lib/services/FormService';
import {db} from 'src/lib/db';
import Form, {ISubmitEvent} from "@rjsf/core";
import {ErrorInfo, getErrorInfo, getFirst, isErrorInfo} from '../../lib/client_utils';
import Error from 'next/error';
import Head from 'next/head';
import {Previewer} from '../components/Previewer';
import {ApiClient} from '../ApiClient';

type FormPageProps = {
    data: FormWithData | ErrorInfo;
    source?: string;
}

export default function FormPage(props: FormPageProps) {

    async function onSubmit(event: ISubmitEvent<unknown>) {

        if (isErrorInfo(props.data)) return;

        if (event.errors.length === 0) {
            const response = await new ApiClient().sendForm(props.data.id, {
                data: event.formData,
                source: props.source
            })
            console.log(response);
        }
    }


    if (isErrorInfo(props.data)) {
        return <Error statusCode={props.data.code} title={props.data.msg}/>
    }


    return <>
        <Head>
            <title>{props.data.schema.title || props.data.id}</title>
        </Head>
        <div className="row">
            <div className="col m-3">
                {props.source && <Previewer toPreview={props.source}/>}
            </div>
            <div className="col m-3">
                <Form schema={props.data.schema}
                      onSubmit={onSubmit}
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

