'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Text,
    Image,
    Grid,
    GridItem,
    Icon,
    VStack,
    HStack,
    Heading,
    Divider,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    Flex,
    Spacer,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    useToast,
    NumberInput,
    NumberInputField
} from '@chakra-ui/react';
import { FaUser, FaStar, FaEthereum, FaInfoCircle, FaHandshake, FaMoneyBillWave, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { CloneType } from '../utils/types';

import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CycloneAddress, CycloneAbi } from '../utils/constants';


const Clone = ({ clone }: { clone: CloneType }) => {
    const { writeContract } = useWriteContract();
    const toast = useToast();

    const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'clone' }[]>([]);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [subscriptionEndTs, setSubscriptionEndTs] = useState<string>('');

    const [audio_url, setAudioUrl] = useState<string>('');
    const [video_url, setVideoUrl] = useState<string>('');  // TODO: idle

    const [newSubscriptionDuration, setNewSubscriptionDuration] = useState<number>(0);
    const { isOpen: isOpen_Subscribe, onOpen: onOpen_Subscribe, onClose: onClose_Subscribe } = useDisclosure();


    const account = useAccount();

    const { data: subscription_end_ts } = useReadContract({
        address: CycloneAddress,
        abi: CycloneAbi,
        functionName: 'subscriptions',
        args: [account.address, BigInt(clone.id)],
    });

    useEffect(() => {
        if (subscription_end_ts) {
            setSubscriptionEndTs(
                new Date(Number(subscription_end_ts) * 1000).toLocaleString()
            )
        }
    }, [subscription_end_ts]);

    const executeSubscribe = async () => {
        try {
            console.log('newSubscriptionDuration', newSubscriptionDuration);
            console.log('clone.id', clone.id);
            const tx = writeContract({
                address: CycloneAddress,
                abi: CycloneAbi,
                functionName: 'subscribe',
                args: [BigInt(clone.id), BigInt(newSubscriptionDuration)],
                value: BigInt(clone.price * BigInt(newSubscriptionDuration)),
            });

            //const receipt = await tx.wait();
            //console.log('receipt', receipt);
            onClose_Subscribe();
        } catch (error: any) {
            console.error('error', error);
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    }



    const handleSendMessage = async () => {
        if (inputMessage.trim() !== '') {
            setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: "user" }]);
            let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/interact/${clone.id}/${inputMessage.trim()}/`, {
                method: 'GET',
            });

            let data = await response.json();
            console.log('data', data);

            const chatResponse = data.text;
            const videoUrl = data.video;
            const audioUrl = data.audio;

            if (videoUrl) {
                setVideoUrl(videoUrl);
            }

            if (audioUrl) {
                setAudioUrl(audioUrl);
            }

            setMessages(prevMessages => [...prevMessages, { text: chatResponse, sender: "clone" }]);
            setInputMessage('');
        }
    };

    return (
        <Box bg="gray.900" height="100vh" p={4}>
            <Grid templateColumns="35% 1fr" gap={4} height="100%">
                <GridItem>
                    <VStack spacing={4} align="stretch" bg="gray.800" borderRadius="xl" overflow="hidden" boxShadow="lg" height="100%">
                       <Box width="100%" paddingBottom="100%" position="relative" maxHeight="35vh">
                            {video_url ? (
                                <video src={video_url} autoPlay loop muted style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
                            ) : (
                                <Image
                                    src={`https://ipfs.io/ipfs/${clone.img_hash}`}
                                    alt={clone.name}
                                    objectFit="cover"
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                />
                            )}
                        </Box>
                        <Box p={4} overflowY="auto" flex={1}>
                            <Heading as="h2" size="md" mb={2} color="white">
                                {clone.name}
                            </Heading>
                            <VStack spacing={2} align="start">
                                <HStack>
                                    <Icon as={FaUser} color="blue.200" />
                                    <Text fontWeight="medium" color="white" fontSize="sm">
                                        Owner: {clone.owner.slice(0, 6)}...{clone.owner.slice(-4)}
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Icon as={FaEthereum} color="blue.200" />
                                    <Text fontWeight="medium" color="white" fontSize="sm">
                                        {Number(clone.price)} WEI / second
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Icon as={FaStar} color="yellow.500" />
                                    <Text fontWeight="medium" color="white" fontSize="sm">
                                        {clone.rating} stars
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Icon as={FaInfoCircle} color="blue.200" />
                                    <Text fontWeight="bold" color="white" fontSize="sm">Subscription End:
                                    {
                                        subscriptionEndTs
                                            ? subscriptionEndTs
                                            : 'Not Subscribed'
                                    }
                                    
                                    </Text>
                                </HStack>
                                <Divider />
                                <HStack>
                                    <Icon as={FaInfoCircle} color="blue.200" />
                                    <Text fontWeight="bold" color="white" fontSize="sm">Description:</Text>
                                </HStack>
                                <Text color="white" fontSize="xs">
                                    {clone.description}
                                </Text>
                            </VStack>
                        </Box>
                        <HStack spacing={2} p={2}>
                            <Button
                                leftIcon={<Icon as={FaHandshake} />}
                                colorScheme="purple"
                                variant="solid"
                                size="sm"
                                flex={1}
                                onClick={onOpen_Subscribe}
                            >
                                Subscribe
                            </Button>
                            <Button
                                leftIcon={<Icon as={FaMoneyBillWave} />}
                                colorScheme="green"
                                variant="solid"
                                size="sm"
                                flex={1}
                            >
                                Collect
                            </Button>
                        </HStack>
                        <HStack>
                            <Button
                                leftIcon={<Icon as={FaArrowUp} />}
                                bg={"green.500"}
                                variant="solid"
                                size="sm"
                                flex={1}
                            />

                            <Button
                                leftIcon={<Icon as={FaArrowDown} />}
                                colorScheme="red"
                                bg={"red.500"}
                                variant="solid"
                                size="sm"
                                flex={1}
                            />
                        </HStack>

                    </VStack>
                </GridItem>

                <GridItem>
                    <Box bg="gray.800" p={4} borderRadius="xl" boxShadow="lg" height="100%" display="flex" flexDirection="column">
                        <Heading as="h3" size="md" color="white" mb={4}>
                            Chat with {clone.name}
                        </Heading>
                        <Box flex={1} overflowY="auto" bg="gray.800" borderRadius="md" p={4} mb={4}>
                            {messages.map((message, index) => (
                                <Flex
                                    key={index}
                                    justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                                    mb={2}
                                >
                                    <Box 
                                        bg={message.sender === 'user' ? 'blue.500' : 'green.500'} 
                                        color="white" 
                                        borderRadius="lg" 
                                        p={2} 
                                        maxWidth="80%"
                                    >
                                        {message.text}
                                    </Box>
                                </Flex>
                            ))}
                        </Box>
                        <InputGroup size="md">
                            <Input
                                placeholder="Type your message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                bg="gray.700"
                                color="white"
                                border="none"
                                borderRadius="full"
                                pr="3.5rem"
                            />
                            <InputRightElement width="3rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={handleSendMessage}
                                    bg="transparent"
                                    _hover={{ bg: 'blue.500' }}
                                    borderRadius="full"
                                >
                                    <Icon as={FaArrowUp} color="white" />
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </Box>
                </GridItem>
            </Grid>


            {/* Modal for subscribing */}
            <Modal isOpen={isOpen_Subscribe} onClose={onClose_Subscribe}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Subsribe Funds</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mt={4}> Enter the duration in days you wish to subscribe for </Text>
                        <NumberInput onChange={(valueString) => setNewSubscriptionDuration(Number(valueString) * 24 * 60 * 60)}>
                            <NumberInputField />
                        </NumberInput>
                    </ModalBody>
                    <ModalFooter>
                        <Button mr={3} onClick={executeSubscribe}>
                            Subscribe
                        </Button>

                        <Button variant="ghost" onClick={onClose_Subscribe}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

        </Box>

    );

};


export default Clone;