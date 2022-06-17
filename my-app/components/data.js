import Image from "next/image";

export default function Data({ metadata }) {
  return metadata.map((data, index) => {
    return (
      <div key={index} className="m-4 shadow-xl shadow-pink-500/50 rounded-lg ">
        <Image
          loader={() => data.image}
          src={data.image}
          alt="nft image"
          width={350}
          height={220}
        />
        <h1 className="font-mono font-semibold px-3 py-2">{data.name}</h1>
      </div>
    );
  });
}
