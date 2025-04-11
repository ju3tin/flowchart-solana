import { RiNftLine } from "react-icons/ri";
import { BsCoin } from "react-icons/bs";
import { HiOutlineCircleStack } from "react-icons/hi2";
import { LuVote } from "react-icons/lu";
import { MdOutlineSwapHoriz } from "react-icons/md";
import { FaArrowRightLong } from "react-icons/fa6";
import { LuWheat } from "react-icons/lu";
import { PiParachuteLight } from "react-icons/pi";
import { BsFire } from "react-icons/bs";
import { PiStepsBold } from "react-icons/pi";
import { BiWater } from "react-icons/bi";
import { RiSafe3Line } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { AiOutlineGold } from "react-icons/ai";
import { tokenMintProgram } from "../nodes/onChain/programs/tokenMintProgram";

export const programs = [
    {
        name: 'Token Mint', 
        icon: BsCoin,
        flow: tokenMintProgram,
    },
    {name: 'Token Transfer', icon: FaArrowRightLong },
    {
        name: 'Token Swap',
        icon: MdOutlineSwapHoriz,
    },
    {name: 'Token Burn', icon: BsFire},
    {name: 'Token Vesting', icon: PiStepsBold},
    {name: 'Token Escrow', icon: RiSafe3Line},
    {name: 'NFT Mint', icon: RiNftLine},
    {name: 'Staking Pool', icon: HiOutlineCircleStack},
    {name: 'Dao Voting', icon: LuVote },
    {name: 'Liquidity Pool', icon: BiWater},
    {name: 'Airdrop', icon: PiParachuteLight},
    {name: 'Yield Farming', icon: LuWheat},
    {name: 'Lending Protocol', icon: FaRegCalendarAlt},
    {name: 'Treasury Management', icon: AiOutlineGold},
];
