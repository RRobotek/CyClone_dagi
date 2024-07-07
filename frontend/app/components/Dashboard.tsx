'use client';
import React, { useEffect, useState } from 'react';
import { 
    Spinner, 
    Box, 
    Text, 
    Grid, 
    GridItem, 
    Flex, 
    Spacer, 
    Icon, 
    Button
} from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useReadContract } from 'wagmi';
import { CycloneAddress, CycloneAbi } from '../utils/constants';
import Listing from './Listing';
import { FaCloud, FaPlus } from 'react-icons/fa';
import Link from 'next/link';

const Dashboard = () => {
    const account = useAccount();
    const [maxCloneId, setMaxCloneId] = useState<number>(0);
    const { data: clone_id } = useReadContract({
        address: CycloneAddress,
        abi: CycloneAbi,
        functionName: 'clone_id',
    });

    useEffect(() => {
        if (clone_id) {
            setMaxCloneId(Number(clone_id));
        }
    }, [clone_id]);

    return (
        <div>
        <Box bg="gray.900" minHeight="100vh">
            <Flex bg="gray.800" p={4} alignItems="center" boxShadow="md">
                <Icon as={FaCloud} boxSize={8} color="blue.200" mr={2} />
                <Text fontSize="xl" fontWeight="bold" color="blue.200">
                    Cyclone
                </Text>
                <Spacer />
                <Link href="/create-clone" passHref>
                    <Button
                        leftIcon={<Icon as={FaPlus} />}
                        colorScheme="purple"
                        mr={4}
                    >
                        Create New Clone
                    </Button>
                </Link>
                <ConnectButton />
            </Flex>
            <Box p={8}>
                {account.address ? (
                    maxCloneId > 0 ? (
                        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={8}>
                            {Array.from({ length: maxCloneId }, (_, i) => (
                                <GridItem key={i}>
                                    <Listing cloneId={i} />
                                </GridItem>
                            ))}
                        </Grid>
                    ) : (
                        <Flex justify="center" align="center" height="200px">
                            <Spinner size="xl" color="blue.200" />
                        </Flex>
                    )
                ) : (
                    <Flex justify="center" align="center" height="200px">
                        <Text fontSize="xl" fontWeight="bold" color="gray.500">
                            Please connect your wallet to view the dashboard.
                        </Text>
                    </Flex>
                )}
            </Box>
        </Box>
        </div>
    );
};

export default Dashboard;
