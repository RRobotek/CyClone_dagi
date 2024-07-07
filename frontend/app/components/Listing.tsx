'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Text,
    Icon,
    Image,
    VStack,
    HStack,
    Badge,
    Heading,
    Flex,
    Spacer,
} from '@chakra-ui/react';
import { useReadContract } from 'wagmi';
import { CycloneAddress, CycloneAbi } from '../utils/constants';
import { CloneType, toClone } from './../utils/types';
import { FaUser, FaStar, FaEthereum } from 'react-icons/fa';
import Link from 'next/link';

const Listing: React.FC<{ cloneId: number }> = ({ cloneId }) => {
    const [clone, setClone] = useState<CloneType | null>(null);
    const { data: clone_data } = useReadContract({
        address: CycloneAddress,
        abi: CycloneAbi,
        functionName: 'clones',
        args: [BigInt(cloneId)],
    });

    useEffect(() => {
        if (clone_data) {
            console.log('clone_data', clone_data);
            let _clone: CloneType = toClone(clone_data as any);
            setClone(_clone);
        }
    }, [clone_data]);

    return (
        <Link href={`/clone/${cloneId}`} passHref>
            <Box
                bg="gray.800"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                transition="all 0.3s"
                _hover={{
                    transform: 'translateY(-5px)',
                    boxShadow: 'xl',
                    cursor: 'pointer',
                    bg: 'gray.700',
                }}
            >
                <Image
                    src={`https://ipfs.io/ipfs/${clone?.img_hash}`}
                    alt="Clone Image"
                    objectFit="cover"
                    width="100%"
                    height="200px"
                />
                <Box p={6}>
                    <Flex align="center" mb={4}>
                        <Heading as="h3" fontSize="2xl" fontWeight="bold" color="white">
                            {clone?.name}
                        </Heading>
                        <Spacer />
                        <Badge
                            colorScheme="purple"
                            fontSize="sm"
                            textTransform="uppercase"
                            fontWeight="bold"
                            px={2}
                            py={1}
                        >
                            #{cloneId}
                        </Badge>
                    </Flex>
                    <VStack spacing={3} align="start">
                        <HStack>
                            <Icon as={FaUser} color="purple.500" />
                            <Text fontWeight="medium" color="white">
                                Owner: {clone?.owner.slice(0, 6)}...{clone?.owner.slice(-4)}
                            </Text>
                        </HStack>
                        <HStack>
                            <Icon as={FaEthereum} color="purple.500" />
                            <Text fontWeight="medium" color="white">
                                {((30*24*60*60 * Number(clone?.price)) / 10**18).toFixed(8)} ETH / month
                            </Text>
                        </HStack>
                        <HStack>
                            <Icon as={FaStar} color="yellow.500" />
                            <Text fontWeight="medium" color="white">
                                {clone?.rating} stars
                            </Text>
                        </HStack>

                        <Text color="white" fontSize="sm" fontFamily={'monospace'}>
                            {clone?.description}
                        </Text>
                    </VStack>
                </Box>
            </Box>
        </Link>
    );
};

export default Listing;
