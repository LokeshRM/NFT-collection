export default function handler(req, res) {
  const { id } = req.query;
  const image_url = "https://crypto-rain.netlify.app/api/images/";
  res.status(200).json({
    name: "Crypto-Rain #" + id,
    description: "Nft collection for the developers",
    image: image_url + id,
  });
}
