import { INodeParams, INodeCredential } from '../src/Interface'

class InworldApi implements INodeCredential {
    label = 'Inworld API'
    name = 'inworldApi'
    version = 1.0
    description = 'Use the Base64 API credential from the Inworld Portal. Do not encode it again.'
    inputs: INodeParams[] = [
        {
            label: 'Inworld API Key',
            name: 'inworldApiKey',
            type: 'password'
        }
    ]
}

module.exports = { credClass: InworldApi }
