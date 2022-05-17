import Accordion from 'react-bootstrap/Accordion'
import Info from '../Info'

type props = {
    ownedTokens: string[];
    ownerAddress: string;
    collectionName: string;
    contractAddress: string;

}

export default function List({ownedTokens, ownerAddress, collectionName, contractAddress}: props) {

    return (
        <Accordion>
            <Accordion.Item eventKey={'0'} key={`${contractAddress}-0`}>
                <Accordion.Header>{`${collectionName} Lookup`}</Accordion.Header>
                <Accordion.Body>
                    <Info
                        contractAddress={contractAddress}
                        ownerAddress={ownerAddress}
                        tokenId={'123'}
                        lookup={true}
                    />
                </Accordion.Body>
            </Accordion.Item>
            {ownedTokens.map((v, i) => {
                return (
                    <Accordion.Item eventKey={(i+1).toString()} key={`${contractAddress}-${(i+1)}`}>
                    <Accordion.Header>{`${collectionName} #${v}`}</Accordion.Header>
                        <Accordion.Body>
                            <Info
                                contractAddress={contractAddress}
                                ownerAddress={ownerAddress}
                                tokenId={v}
                                lookup={false}
                            />
                        </Accordion.Body>
                  </Accordion.Item>
                )
            })}
        </Accordion>  
    )
}