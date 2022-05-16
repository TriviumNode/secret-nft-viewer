import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner'
import { queryNftDossier } from '../../utils/secretHelper';
import ReactJson from 'react-json-view'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import decryptImage from '../../utils/decryptImage';
import blobToBase64 from '../../utils/blobToBase64';

type trait = {
    display_type: string | null;
    max_value: string| null;
    trait_type: string;
    value: string;
}

type props = {
    tokenId: string;
    contractAddress: string;
    ownerAddress: string;
}

export default function Info({tokenId, contractAddress, ownerAddress}: props){
    const [dossier, setDossier] = useState({});
    const [pubImage, setPubImage] = useState();
    const [privImage, setPrivImage] = useState();
    const [privAttributes, setPrivAttributes] = useState([]);
    const [pubAttributes, setPubAttributes] = useState([]);

    useEffect(() => {
        getData();
    },[]);

    useEffect(() => {
        //@ts-ignore
        decryptImages();
        //@ts-ignore
        setPrivAttributes(dossier.private_metadata?.extension?.attributes || []);
        //@ts-ignore
        setPubAttributes(dossier.public_metadata?.extension?.attributes || []);
    },[dossier]);

    const getData = async() => {
        const {nft_dossier} = await queryNftDossier({
            contractAddress: contractAddress,
            ownerAddress: ownerAddress,
            tokenId: tokenId
        })
        //@ts-ignore
        setDossier(nft_dossier);
        //console.log(nft_dossier);
    }

    const decryptImages = async() => {
        try {
        // HANDLE PRIVATE IMAGE
        //@ts-ignore
        if (dossier.private_metadata?.extension?.media) {
            //@ts-ignore
            if (dossier.private_metadata.extension.media[0].authentication?.key) {
                //@ts-ignore
                const decrypted = await decryptImage(dossier.private_metadata.extension.media[0].url, dossier.private_metadata.extension.media[0].authentication?.key);
                if (!!decrypted.length) {

                    const blob = new Blob([decrypted], {
                        //@ts-ignore
                        type: `${dossier.private_metadata.extension.media[0].file_type}/${dossier.private_metadata.extension.media[0].extension}`,
                    });

                    const base64 = await blobToBase64(blob);
                
                    //@ts-ignore
                    setPrivImage(base64)
                }
            } else {
                //@ts-ignore
                setPrivImage(dossier.private_metadata.extension.media[0].url)
            }

        } else {
            //@ts-ignore
            setPrivImage(dossier.private_metadata.extension.image)
        }

        // HANDLE PUBLIC IMAGE
        //@ts-ignore
        if (dossier.public_metadata?.extension?.media) {
            //@ts-ignore
            if (dossier.public_metadata.extension.media[0].authentication?.key) {
                //@ts-ignore
                const decrypted = await decryptImage(dossier.public_metadata.extension.media[0].url, dossier.public_metadata.extension.media[0].authentication?.key);
                if (!!decrypted.length) {

                    const blob = new Blob([decrypted], {
                        //@ts-ignore
                        type: `${dossier.public_metadata.extension.media[0].file_type}/${dossier.public_metadata.extension.media[0].extension}`,
                    });

                    const base64 = await blobToBase64(blob);
                    //@ts-ignore
                    setPubImage(base64)
                }
            } else {
                //@ts-ignore
                setPubImage(dossier.public_metadata.extension.media[0].url)
            }

        } else {
            //@ts-ignore
            setPubImage(dossier.public_metadata.extension.image)
        }
    } catch(error) {
        console.error("AAA", error)
    }
    }

    if (!dossier) return <Spinner animation="border" variant="primary" size="sm" />
    return(
        <Container>
            <Row className="mb-10">
                <Col md='6'>
                    <h3>Public Image:</h3>
                    <Image src={pubImage} fluid/>
                </Col>
                <Col md='6'>
                    <h3>Private Image:</h3>
                    <Image src={privImage} fluid/>
                </Col>
            </Row>
            <Row>
                <Col>
                <h3>Public Attributes:</h3>
                {
                    //@ts-ignore
                    pubAttributes.map((v: trait, i: number) => {
                        return (
                            <>
                                <h6 style={{marginBottom: '0px'}}>{v.trait_type}</h6>
                                <span style={{marginBottom: '10px'}}>{v.value}</span>
                            </>
                        )
                    })
                }
                </Col>
                <Col>
                    <h3>Private Attributes:</h3>
                    {
                        //@ts-ignore
                        privAttributes.map((v: trait, i: number) => {
                            return (
                                <div style={{paddingBottom: '10px'}}>
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
            <ReactJson src={dossier} collapsed={true} />
        </Container>
    )
}