import React from 'react';


export function Previewer(props: {
    toPreview: string
}) {


    switch (guessType(props.toPreview)) {
        case 'image':
            return <img src={props.toPreview}/>
        case 'pdf':
            return <div>
                Aqui va pdf
            </div>
    }
}

function guessType(type: string): 'pdf' | 'image' {
    if (
        type.endsWith('jpg')
        || type.endsWith('png')
    ) return 'image';
    return 'pdf';
}
