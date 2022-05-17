import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner'
import { queryNftDossier, Extension } from '../../utils/secretHelper';
import ReactJson from 'react-json-view'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import decryptImage from '../../utils/decryptImage';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Trait } from 'secretjs/dist/extensions/snip721/types';

interface Props {
    tokenId?: string;
    contractAddress: string;
    ownerAddress: string;
    lookup?: boolean;
}

const getExternalMeta = async(uri: string) => {
    try {
        const {data} = await axios.get(uri)
        return data;
    } catch(e) {
        console.error(e)
    }
}

export default function Info({tokenId = '0', contractAddress, ownerAddress, lookup = false}: Props){
    const [view, setView] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rawDossier, setRawDossier] = useState();
    const [pubImage, setPubImage] = useState<string | ArrayBuffer | null>('');
    const [privImage, setPrivImage] = useState<string | ArrayBuffer | null>('');
    const [privAttributes, setPrivAttributes] = useState([]);
    const [pubAttributes, setPubAttributes] = useState([]);
    const [lookupId, setLookupId] = useState<string>(tokenId);
    const [decrypting, setDecrypting] = useState(false);

    const getData = async() => {
        setLoading(true);

        // Query nft_dossier
        const {nft_dossier} = await queryNftDossier({
            contractAddress: contractAddress,
            ownerAddress: ownerAddress,
            tokenId: lookupId
        })
        console.log('*NFT*', nft_dossier);
        //@ts-ignore
        setRawDossier(nft_dossier);

        // Process metadata, get external metadata
        var privExt: Extension | undefined;
        var pubExt: Extension | undefined;      

        // Private
        if (nft_dossier?.private_metadata?.extension) privExt = nft_dossier?.private_metadata.extension
        else if (nft_dossier?.private_metadata?.token_uri) privExt = await getExternalMeta(nft_dossier?.private_metadata.token_uri)
        console.log('privExt',privExt)

        // Public
        if (nft_dossier?.public_metadata?.extension) pubExt = nft_dossier.public_metadata.extension
        else if (nft_dossier?.public_metadata?.token_uri) pubExt = await getExternalMeta(nft_dossier.public_metadata.token_uri)
        console.log('pubExt',pubExt);

        //@ts-ignore
        setPrivAttributes(privExt?.attributes || [{trait_type: 'None', value: ''}]);
        //@ts-ignore
        setPubAttributes(pubExt?.attributes || [{trait_type: 'None', value: ''}]);

        // Show the data we have so far
        setView(true);
        setLoading(false);

        //find images and decrypt if needed
    try {
        // HANDLE PRIVATE IMAGE
        if (privExt?.media) {
            if (privExt?.media[0].authentication?.key) {
                setDecrypting(true);
                const decrypted = await decryptImage(privExt?.media[0].url, privExt?.media[0].authentication?.key,privExt?.media[0].file_type,privExt?.media[0].extension);
                setPrivImage(decrypted)
                setDecrypting(false);
            } else {
                setPrivImage(privExt?.media[0].url)
            }
        } else if (privExt?.image) {
            setPrivImage(privExt?.image)
        } else console.error('no priv image')

        // HANDLE PUBLIC IMAGE
        if (pubExt?.media) {
            if (pubExt?.media[0].authentication?.key) {
                setDecrypting(true);
                console.log('decrypting pub image', pubExt?.media[0])
                const decrypted = await decryptImage(pubExt?.media[0].url, pubExt?.media[0].authentication?.key, pubExt?.media[0].file_type, pubExt?.media[0].extension);
                setPubImage(decrypted);
                setDecrypting(false);
            } else {
                console.log('non-encrypted pub image', pubExt?.media[0].url)
                setPubImage(pubExt?.media[0].url)
            }
        } else if (pubExt?.image) {
            setPubImage(pubExt?.image)
        } else console.error('no pub image')
    } catch(error) {
        console.error("AAA", error)
        setDecrypting(false);
    }

    }

    if (loading) return <Spinner animation="border" variant="primary" size="sm" />
    if (!view) return (<>
        {lookup ?
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Token ID</Form.Label>
                    <Form.Control
                        type="text" 
                        placeholder="123"
                        value={lookupId} 
                        onChange={(e=>setLookupId(e.target.value))}
                    />
                </Form.Group>
            </Form>
        : null
        }

        
        <Button onClick={() => getData()}>Load Data</Button>
    
    </>
    )
    return(
        <Container>
            <Row className="mb-10">
                <Col md='6'>
                    <h3>Public Image:</h3>
                    <Image src={pubImage as string} fluid/>

                </Col>
                <Col md='6'>
                    <h3>Private Image:</h3>
                    <Image src={privImage as string} fluid/>
                </Col>
            </Row>
            { decrypting ?
            <Row className='justify-content-center'>
                <Col md='auto'>
                    <h6>Please Wait. Decrypting Image(s)...</h6>
                </Col>
            </Row>
            :null}
            <br/>
            <Row>
                <Col>
                <h3>Public Attributes:</h3>
                {
                    //@ts-ignore
                    pubAttributes.map((v: Trait, i: number) => {
                        return (
                            <div style={{paddingBottom: '10px'}} key={`pub-attrib-${i}`}>
                                <h6 style={{marginBottom: '0px'}}>{v.trait_type}</h6>
                                <span>{v.value}</span>
                            </div>
                        )
                    })
                }
                </Col>
                <Col>
                    <h3>Private Attributes:</h3>
                    {
                        privAttributes.map((v: Trait, i: number) => {
                            return (
                                <div style={{paddingBottom: '10px'}} key={`pub-attrib-${i}`}>
                                    <h6 style={{marginBottom: '0px'}}>{v.trait_type}</h6>
                                    <span>{v.value}</span>
                                </div>
                            )
                        })
                    }
                </Col>
            </Row>
            <br />
            <h4>Raw Data:</h4>
            <ReactJson src={rawDossier || {}} collapsed={true} name={`NFT Dossier`} displayDataTypes={false}/>
        </Container>
    )
}