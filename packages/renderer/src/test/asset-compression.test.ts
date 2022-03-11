import {TAsset} from 'remotion';
import {compressAsset} from 'remotion/src/compress-assets';
import {calculateAssetPositions} from '../assets/calculate-asset-positions';

test('Should compress and uncompress assets', () => {
	const uncompressed: TAsset[] = [
		[
			{
				frame: 0,
				id: 'my-id',
				src: String('x').repeat(1000),
				isRemote: true,
				mediaFrame: 0,
				playbackRate: 1,
				type: 'video' as const,
				volume: 1,
			},
		],
		[
			{
				frame: 1,
				id: 'my-id',
				src: String('x').repeat(1000),
				isRemote: true,
				mediaFrame: 0,
				playbackRate: 1,
				type: 'video' as const,
				volume: 1,
			},
		],
	].flat(1);

	const compressedAssets = uncompressed.map((asset, i) => {
		return compressAsset(uncompressed.slice(0, i), asset);
	});

	expect(compressedAssets[0].src).toBe(String('x').repeat(1000));
	expect(compressedAssets[1].src).toBe('same-as-my-id-0');

	const assPos = calculateAssetPositions([compressedAssets]);
	expect(assPos).toEqual([
		{
			duration: 1,
			id: 'my-id',
			isRemote: true,
			playbackRate: 1,
			src: String('x').repeat(1000),
			startInVideo: 0,
			trimLeft: 0,
			type: 'video',
			volume: 1,
		},
	]);
});
