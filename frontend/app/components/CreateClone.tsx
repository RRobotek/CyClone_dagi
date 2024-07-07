//'use client';
import { useState, useEffect, FC } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  NumberInput,
  NumberInputField,

  Text,
  HStack,
} from '@chakra-ui/react';
import { FaImage, FaFileAlt, FaCloudUploadAlt, FaHome, FaInfoCircle, FaEthereum, FaClock, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

import { CycloneAddress, CycloneAbi } from '../utils/constants';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { wagmiConfig } from '../utils/providers';

const CreateClone: FC = () => {
  const {writeContract} = useWriteContract();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<bigint>(BigInt(0));
  const [image, setImage] = useState<File | null>(null);
  const [kbFiles, setKbFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();

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



  const handleImageChange = (e: any) => {
    setImage(e.target.files[0]);
  };

  const handleKbFilesChange = (e: any) => {
    setKbFiles([...kbFiles, ...e.target.files]);
  };

  const removeKbFile = (index: number) => {
    setKbFiles(kbFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    if (!image /*|| kbFiles.length === 0*/) {
      toast({
        title: 'Error',
        description: "Please select an image and at least one KB file.",
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);


      return;
    }

    const formData = new FormData();
    formData.append('file', image);

    try {
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/image/`, {
        method: 'POST',
        body: formData
      });

      console.log('response', response);

      if (!response.ok) {
        throw new Error('Failed to create clone');
      }

      let data = await response.json();
      const imgIpfsHash: string = data.ipfs_hash as string;

      console.log('data', data);
      console.log('1. imgIpfsHash', imgIpfsHash);


      let kbIpfsHashes = [];
      for(let i = 0; i < kbFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', kbFiles[i]);

        let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to create clone');
        }

        let data = await response.json();
        console.log('data kb', data);
        console.log('2. kbIpfsHash', data.ipfs_hash as string);
        kbIpfsHashes.push(data.ipfs_hash as string);
      }

      console.log('imgIpfsHash', imgIpfsHash);
      console.log('kbIpfsHashes', kbIpfsHashes);



      // Write to the blockchain
      writeContract({
        address: CycloneAddress,
        abi: CycloneAbi,
        functionName: 'createClone',
        args: [imgIpfsHash, kbIpfsHashes, price, name, description],
      });

      // Reset form
      setName('');
      setDescription('');
      setPrice(BigInt(0));
      setImage(null);
      setKbFiles([]);

      toast({
        title: 'Clone created.',
        description: "Your clone has been successfully created.",
        status: 'success',
        duration: 9000,
        isClosable: true,
      });



      // Redirect to the new clone page
      //router.push(`/clone/${clone_id}`);

    } catch (error: any) {
      console.error('Error creating clone:', error);
      toast({
        title: 'Error creating clone.',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }


  };

  return (
    <Box bg="gray.900" minHeight="100vh" py={8}>
      <Box maxWidth="600px" margin="auto" bg="gray.800" p={8} borderRadius="xl" boxShadow="lg">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Heading as="h1" size="xl" color="white">
              Create New Clone
            </Heading>
            <Button
              onClick={() => router.push('/')}
              leftIcon={<FaHome/>}
              colorScheme="teal"
              variant="outline"
            >
              Home
            </Button>
          </HStack>
          <VStack spacing={4} as="form" onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel color="white">Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                color="white"
                bg="gray.800"
                placeholder="Enter clone name"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="white">Description</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                color="white"
                bg="gray.800"
                placeholder="Describe your clone"
              />
            </FormControl>
            <FormControl>
              <FormLabel color="white">Price (WEI) / second</FormLabel>
              <NumberInput
                min={0}
                value={Number(price)}
                onChange={(valueString) => setPrice(BigInt(valueString))}
                color="white"
              >
                <NumberInputField bg="gray.800" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel color="white">Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                display="none"
                id="image-upload"
              />
              <Button
                as="label"
                htmlFor="image-upload"
                leftIcon={<FaImage />}
                colorScheme="purple"
                variant="outline"
                width="100%"
              >
                {image ? image.name : 'Choose Image'}
              </Button>
            </FormControl>
            <FormControl>
              <FormLabel color="white">Knowledge Base Files</FormLabel>
              <Input
                type="file"
                accept=".txt,.pdf,.doc,.docx,.md,.html"
                onChange={handleKbFilesChange}
                display="none"
                id="kb-files-upload"
                multiple
              />
              <Button
                as="label"
                htmlFor="kb-files-upload"
                leftIcon={<FaFileAlt />}
                colorScheme="purple"
                variant="outline"
                width="100%"
              >
                Choose KB Files
              </Button>
              <VStack mt={2} align="stretch">
                {kbFiles.map((file, index) => (
                  <HStack key={index} justify="space-between" bg="gray.800" p={2} borderRadius="md">
                    <Text color="white">{file.name}</Text>
                    <Button size="sm" onClick={() => removeKbFile(index)} colorScheme="red" variant="ghost">
                      <FaTrash />
                    </Button>
                  </HStack>
                ))}
              </VStack>
            </FormControl>
            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="100%"
              leftIcon={<FaCloudUploadAlt />}
              isLoading={isLoading}
              loadingText="Creating Clone"
            >
              Create Clone
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default CreateClone;