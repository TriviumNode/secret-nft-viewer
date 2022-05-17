import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { queryContractInfo, queryOwnedTokens, Keplr, ChainId } from '../../utils/secretHelper';
import { toast } from 'react-toastify';
import List from '../List';
import Spinner from 'react-bootstrap/Spinner'



function Main() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paramAddress = urlParams.get('contract')

    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [owned, setOwned] = useState<string[]>([]);
    const [contractAddress, setContractAddress] = useState(paramAddress || '')
    const [ownerAddress, setOwnerAddress] = useState('')
    const [collectionName, setCollectionName] = useState('')



    const handleSubmit = async(e: { preventDefault: () => void; }) => {
        e.preventDefault();

        setLoading(true);
        setOwned([]);
        setCollectionName('');


        if (!Keplr) {
            toast.error('Keplr extension not found!');
            return;
        }

        //get address
        Keplr.enable(ChainId)
        const keplrOfflineSigner = Keplr.getOfflineSignerOnlyAmino(ChainId);
        const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts();
    
        const { contract_info } = await queryContractInfo({contractAddress: contractAddress});
        console.log('*CONTRACT INFO*', contract_info);
        setCollectionName(contract_info.name);

        const { token_list: { tokens } } = await queryOwnedTokens({contractAddress: contractAddress, ownerAddress: myAddress});
        if (!tokens.length) {
            toast.error(`No NFTs found for address ${myAddress}`);
        } else {
            setOwned(tokens);
        }
        setLoading(false);
        setLoaded(true)
    }
    
    
    return (
    <Container>
    <Row className="justify-content-center">
        <Col md="6">
            <Form noValidate onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Form.Group as={Col} md="8" controlId="validationCustom01">
                        <Form.Label>Contract Address</Form.Label>
                        <Form.Control
                        required
                        type="text"
                        placeholder="secret1..."
                        value={contractAddress}
                        onChange={v => setContractAddress(v.target.value)}
                        />
                    </Form.Group>
                </Row>

                <Button type="submit">
                    {loading ?
                        <Spinner animation="border" variant="light" />
                    :
                        'View'
                    }
                </Button>
            </Form>
        </Col>
    </Row>

    <div style={{height: "15px"}} />
    
    {loaded ?
        <Row className="justify-content-center">
            <Col md="8">
                <List
                    ownedTokens={owned}
                    ownerAddress={ownerAddress}
                    collectionName={collectionName}
                    contractAddress={contractAddress}
                />
            </Col>
        </Row>
    :
        null
    }
    </Container>
  );
}

export default Main;