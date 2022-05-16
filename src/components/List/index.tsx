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
            {ownedTokens.map((v, i) => {
                return (
                    <Accordion.Item eventKey={i.toString()}>
                    <Accordion.Header>{`${collectionName} #${v}`}</Accordion.Header>
                        <Accordion.Body>
                            <Info
                                contractAddress={contractAddress}
                                ownerAddress={ownerAddress}
                                tokenId={v}
                            />
                        </Accordion.Body>
                  </Accordion.Item>
                )
            })}
        </Accordion>  
    )
}