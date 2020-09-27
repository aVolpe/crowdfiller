import React, {useCallback, useEffect, useRef} from 'react';
import {GetServerSideProps} from 'next';
import {FormWithData, PublicFormService} from 'src/lib/services/FormService';
import {db} from 'src/lib/db';
import Form, {ISubmitEvent} from "@rjsf/core";
import {ErrorInfo, getErrorInfo, getFirst, isErrorInfo} from '../../lib/client_utils';
import Error from 'next/error';
import Head from 'next/head';
import {Previewer} from '../components/Previewer';
import {ApiClient} from '../ApiClient';
import {FormIframeEvents} from '../Model';

type FormPageProps = {
    data: FormWithData | ErrorInfo;
    source: string | null;
    /**
     * If this is a iframe, the behaviour changes drastically.
     *
     * 1. There is not submit button, we wait for a message from the host.
     * 2. We send a message to the host with the server response
     * 3. We send a message to the host if an error occur
     *
     * Flow:
     *
     * 1. The parent window send a message `myIframe.contentWindow.postMessage('CROWDFILLER_DO_SUBMIT')`
     * 2. This components validates the input and:
     *
     * 3a. If the form is valid, submits it, and when the server send the response it sends
     *     a message with the name `CROWDFILLER_SUBMITTED` and the a object with the response key.
     * 3b. If the form is invalid, it sends a event with the name `CROWDFILLER_VALIDATION_ERROR` with
     *     and object with the errors in the 'errors' key. It will also display the errors bellow each
     *     component
     *
     */
    isIframe: boolean;
}

export default function FormPage(props: FormPageProps) {

    const formRed = useRef<Form<unknown>>();

    const iFrameMessageHandler = useCallback((e: MessageEvent) => {
        if (!e || !e.data) return;
        if (!formRed.current) return;

        const data = e.data as FormIframeEvents;

        switch (data.__crowdfiller_evt_name) {
            case 'CROWDFILLER_VALIDATION_ERROR':
            case 'CROWDFILLER_SUBMITTED':
                break;
            case 'CROWDFILLER_DO_SUBMIT':
                formRed.current.submit();
                break;
        }
    }, [formRed])

    useEffect(() => {
        if (props.isIframe) window.addEventListener('message', iFrameMessageHandler);
        return () => window.removeEventListener('message', iFrameMessageHandler);
    }, [props.isIframe]);

    async function onSubmit(event: ISubmitEvent<unknown>) {

        if (isErrorInfo(props.data)) return;

        try {
            const response = await new ApiClient().sendForm(props.data.id, {
                data: event.formData,
                source: props.source
            })
            if (props.isIframe) {
                window.top.postMessage({
                    __crowdfiller_evt_name: 'CROWDFILLER_SUBMITTED',
                    payload: {
                        response: response.responseId
                    }
                } as FormIframeEvents, '*')
            } else {
                // TODO handle success
            }
        } catch (e) {
            // TODO handle error
        }
    }

    function onError(event: ISubmitEvent<unknown>) {
        if (props.isIframe) {
            window.top.postMessage({
                __crowdfiller_evt_name: 'CROWDFILLER_VALIDATION_ERROR',
                payload: {
                    errors: event.errors
                }
            } as FormIframeEvents, '*')
        } else {
            // TODO handle form validation error
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
                      noHtml5Validate={true}
                      showErrorList={false}
                      ref={formRed}
                      onSubmit={onSubmit}
                      onError={onError}
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
        const isIframe = !!getFirst(context.query.iframe);

        const data = await service.getForm(formId);

        return {
            props: {
                data,
                source: getFirst(context.query.source) || null,
                isIframe
            }
        };
    } catch (ai) {
        console.warn(ai);
        return {
            props: {
                data: getErrorInfo(ai),
                source: null,
                isIframe: false
            }
        }
    }
}

